<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdtTblBinaryPairingAddMembership extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table("tbl_binary_pairing",function ( Blueprint $table )
        {
            $table->integer('binary_pairing_membership')->unsigned()->nullable();
            $table->foreign('binary_pairing_membership')->references('membership_id')->on('tbl_membership')->onDelete('cascade');
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
