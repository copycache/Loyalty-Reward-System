<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ReaddCodeDateSoldEtc extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_codes', function (Blueprint $table) 
        {
            $table->integer('code_sold_to')->unsigned()->nullable();
            $table->foreign('code_sold_to')->references('id')->on('users')->onDelete('cascade');
            $table->datetime('code_date_sold')->nullable();
            $table->datetime('code_date_used')->nullable();
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
