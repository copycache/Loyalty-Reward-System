<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblWelcomeBonusCommissions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_welcome_bonus_commissions', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('membership_id')->unsigned();
            $table->double('commission')->default(0);
            $table->foreign('membership_id')
            ->references('membership_id')->on('tbl_membership')
            ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
