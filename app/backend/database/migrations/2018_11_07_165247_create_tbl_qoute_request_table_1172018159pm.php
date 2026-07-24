<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblQouteRequestTable1172018159pm extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_qoute_request', function (Blueprint $table) 
        {
            $table->increments('qoute_request_id');
            $table->string('qoute_request_name');
            $table->string('qoute_request_email');
            $table->string('qoute_request_phone');
            $table->text('qoute_request_message');
            $table->tinyInteger('qoute_request_status')->default(0);
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
